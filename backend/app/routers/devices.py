# backend/app/routers/devices.py

from typing import AsyncGenerator, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import async_session
from ..models import Device as DeviceModel, Interface as InterfaceModel, InterfaceStats as InterfaceStatsModel
from ..schemas import Device as DeviceSchema, DeviceCreate, Interface as InterfaceSchema, InterfaceStats as InterfaceStatsSchema

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
