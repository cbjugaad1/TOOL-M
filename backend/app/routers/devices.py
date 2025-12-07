# backend/app/routers/devices.py

from typing import AsyncGenerator, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import async_session
from ..models import Device as DeviceModel, Interface as InterfaceModel, InterfaceStats as InterfaceStatsModel
from ..schemas import Device as DeviceSchema, DeviceCreate, Interface as InterfaceSchema, InterfaceStats as InterfaceStatsSchema
import asyncio
import socket
from ..utils.snmp_engine import snmp_get

router = APIRouter()

# Dependency: get DB session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

# -----------------------------
# Add new device
# -----------------------------
@router.post("/", response_model=DeviceSchema)
async def add_device(device: DeviceCreate, session: AsyncSession = Depends(get_session)):
    # Check if device already exists
    query = await session.execute(select(DeviceModel).where(DeviceModel.ip_address == device.ip_address))
    existing = query.scalars().first()
    if existing:
        raise HTTPException(status_code=400, detail="Device with this IP already exists")

    new_device = DeviceModel(
        hostname=device.hostname,
        ip_address=device.ip_address,
        site_id=device.site_id,
        device_type=device.device_type,
        vendor=device.vendor,
        model=device.model,
        os_version=device.os_version,
        status=device.status,
        snmp_version=device.snmp_version,
        snmp_community=device.snmp_community,
        ssh_enabled=device.ssh_enabled,
        ssh_username=device.ssh_username,
        ssh_password=device.ssh_password,
        ssh_port=device.ssh_port
    )
    session.add(new_device)
    await session.commit()
    await session.refresh(new_device)
    return new_device


# -----------------------------
# Connectivity test endpoints
# -----------------------------
@router.post("/test/connectivity")
async def test_connectivity(payload: dict):
    """
    Simple TCP reachability test. Payload: { "ip_address": "1.2.3.4" }
    Attempts to open a TCP socket to common device ports (161 and 22).
    """
    ip = payload.get("ip_address")
    if not ip:
        raise HTTPException(status_code=400, detail="ip_address is required")

    def try_connect(host, port, timeout=2):
        try:
            with socket.create_connection((host, port), timeout=timeout):
                return True
        except Exception:
            return False

    # test SNMP (161) first, then SSH (22)
    reachable_snmp = await asyncio.to_thread(try_connect, ip, 161, 2)
    reachable_ssh = await asyncio.to_thread(try_connect, ip, 22, 2)
    return {"snmp": reachable_snmp, "ssh": reachable_ssh, "any": (reachable_snmp or reachable_ssh)}


@router.post("/test/snmp")
async def test_snmp(payload: dict):
    """
    Test SNMP GET for sysName OID. Payload: { "ip_address": "..", "community": "public", "port": 161 }
    """
    ip = payload.get("ip_address")
    community = payload.get("community", "public")
    port = int(payload.get("port", 161))
    if not ip:
        raise HTTPException(status_code=400, detail="ip_address is required")

    # sysName OID
    oid = "1.3.6.1.2.1.1.5.0"
    try:
        val = await snmp_get(ip, oid, community=community, port=port)
        return {"reachable": bool(val), "value": str(val) if val is not None else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test/ssh")
async def test_ssh(payload: dict):
    """
    Simple SSH port test (TCP connect). Payload: { "ip_address": "..", "port": 22 }
    """
    ip = payload.get("ip_address")
    port = int(payload.get("port", 22))
    if not ip:
        raise HTTPException(status_code=400, detail="ip_address is required")

    def try_connect(host, port, timeout=2):
        try:
            with socket.create_connection((host, port), timeout=timeout):
                return True
        except Exception:
            return False

    ok = await asyncio.to_thread(try_connect, ip, port, 2)
    return {"reachable": ok}

# -----------------------------
# List all devices
# -----------------------------
@router.get("/", response_model=List[DeviceSchema])
async def list_devices(session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(DeviceModel))
    devices = query.scalars().all()
    return devices

# -----------------------------
# Get single device by ID
# -----------------------------
@router.get("/{device_id}", response_model=DeviceSchema)
async def get_device(device_id: int, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(DeviceModel).where(DeviceModel.id == device_id))
    device = query.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    return device

# -----------------------------
# Update device (especially site_id)
# -----------------------------
@router.put("/{device_id}", response_model=DeviceSchema)
async def update_device(device_id: int, payload: dict, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(DeviceModel).where(DeviceModel.id == device_id))
    device = query.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Update fields if provided
    if "site_id" in payload:
        device.site_id = payload["site_id"]
    if "hostname" in payload:
        device.hostname = payload["hostname"]
    if "device_type" in payload:
        device.device_type = payload["device_type"]
    if "snmp_community" in payload:
        device.snmp_community = payload["snmp_community"]
    if "ssh_enabled" in payload:
        device.ssh_enabled = payload["ssh_enabled"]
    if "ssh_username" in payload:
        device.ssh_username = payload["ssh_username"]
    
    await session.commit()
    await session.refresh(device)
    return device

# -----------------------------
# Delete a device
# -----------------------------
@router.delete("/{device_id}", response_model=dict)
async def delete_device(device_id: int, session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(DeviceModel).where(DeviceModel.id == device_id))
    device = query.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    await session.delete(device)
    await session.commit()
    return {"message": f"Device {device.hostname} deleted successfully"}

# -----------------------------
# Get interfaces for a device
# -----------------------------
@router.get("/{device_id}/interfaces", response_model=List[InterfaceSchema])
async def get_device_interfaces(device_id: int, session: AsyncSession = Depends(get_session)):
    # Check if device exists
    query = await session.execute(select(DeviceModel).where(DeviceModel.id == device_id))
    device = query.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Fetch interfaces for the device
    query = await session.execute(select(InterfaceModel).where(InterfaceModel.device_id == device_id))
    interfaces = query.scalars().all()
    return interfaces

# -----------------------------
# Get stats for a device
# -----------------------------
@router.get("/{device_id}/stats", response_model=List[InterfaceStatsSchema])
async def get_device_stats(device_id: int, session: AsyncSession = Depends(get_session)):
    # Check if device exists
    query = await session.execute(select(DeviceModel).where(DeviceModel.id == device_id))
    device = query.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    
    # Fetch stats for all interfaces of this device
    query = await session.execute(
        select(InterfaceStatsModel).join(InterfaceModel).where(InterfaceModel.device_id == device_id)
    )
    stats_list = query.scalars().all()
    return stats_list
