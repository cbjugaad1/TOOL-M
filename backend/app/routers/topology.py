# backend/app/routers/topology.py

from typing import AsyncGenerator, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import or_

from app.database import async_session
from app.models import TopologyLink, Device
from app.schemas import TopologyLink as TopologyLinkSchema

router = APIRouter()


# Dependency: get DB session
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


# --- List all topology links ---
@router.get("/")
async def list_links(session: AsyncSession = Depends(get_session)):
    query = await session.execute(select(TopologyLink))
    links = query.scalars().all()
    result = []
    for link in links:
        src_device = await session.get(Device, link.src_device_id)
        dst_device = await session.get(Device, link.dst_device_id)
        link_data = TopologyLinkSchema.from_orm(link).dict()
        link_data["src_device_name"] = src_device.hostname if src_device else None
        link_data["dst_device_name"] = dst_device.hostname if dst_device else None
        result.append(link_data)
    return result


# --- Get topology links endpoint (for frontend) ---
@router.get("/links")
async def get_links(session: AsyncSession = Depends(get_session)):
    """Get all topology links with device names (returns raw dicts)"""
    try:
        query = await session.execute(select(TopologyLink))
        links = query.scalars().all()
        result = []
        for link in links:
            src_device = await session.get(Device, link.src_device_id)
            dst_device = await session.get(Device, link.dst_device_id) if link.dst_device_id else None
            # serialize minimal link dict matching DB columns + friendly names
            link_data = {
                "id": link.id,
                "src_device_id": link.src_device_id,
                "src_interface": link.src_interface,
                "dst_device_id": link.dst_device_id,
                "dst_interface": link.dst_interface,
                "dst_hostname": link.dst_hostname,
                "last_seen": link.last_seen,
                "src_device_name": src_device.hostname if src_device else None,
                "dst_device_name": dst_device.hostname if dst_device else None,
            }
            result.append(link_data)
        return result
    except Exception as e:
        # avoid raising validation errors to client; log and return minimal failure info
        print(f"[Topology:get_links] error: {e}")
        raise


# --- Get topology graph endpoint (for frontend) ---
@router.get("/graph")
async def get_graph(session: AsyncSession = Depends(get_session)):
    """Get topology graph with nodes (devices) and edges (links)"""
    # Get all devices as nodes
    devices_result = await session.execute(select(Device))
    devices = devices_result.scalars().all()
    
    nodes = [
        {
            "id": device.id,
            "label": device.hostname,
            "type": "device",
            "status": device.status,
            "ipAddress": device.ip_address,
        }
        for device in devices
    ]
    
    # Get all links as edges
    links_result = await session.execute(select(TopologyLink))
    links = links_result.scalars().all()
    # Build edges and also add pseudo-nodes for unknown neighbors (dst_device_id is None)
    edges = []
    existing_node_ids = {n["id"] for n in nodes}

    for link in links:
        src = link.src_device_id
        dst = link.dst_device_id

        # If destination device unknown, create a pseudo-node with negative id
        if dst is None:
            pseudo_id = -link.id  # negative unique id per link
            if pseudo_id not in existing_node_ids:
                nodes.append({
                    "id": pseudo_id,
                    "label": link.dst_hostname or f"unknown-{link.id}",
                    "type": "neighbor",
                    "status": None,
                    "ipAddress": None,
                })
                existing_node_ids.add(pseudo_id)
            dst = pseudo_id

        # Only include edge if source exists (source should be a known device)
        if src in existing_node_ids:
            edges.append({
                "id": link.id,
                "source": src,
                "target": dst,
                "sourceInterface": link.src_interface,
                "targetInterface": link.dst_interface,
            })

    return {
        "nodes": nodes,
        "edges": edges,
    }


# --- Get topology links for a specific device ---
@router.get("/device/{device_id}")
async def device_links(device_id: int, session: AsyncSession = Depends(get_session)):
    device_result = await session.execute(select(Device).where(Device.id == device_id))
    device = device_result.scalars().first()
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    query = await session.execute(
        select(TopologyLink).where(
            or_(
                TopologyLink.src_device_id == device_id,
                TopologyLink.dst_device_id == device_id
            )
        )
    )
    links = query.scalars().all()

    result = []
    for link in links:
        src_device = await session.get(Device, link.src_device_id)
        dst_device = await session.get(Device, link.dst_device_id) if link.dst_device_id else None
        link_data = {
            "id": link.id,
            "src_device_id": link.src_device_id,
            "src_interface": link.src_interface,
            "dst_device_id": link.dst_device_id,
            "dst_interface": link.dst_interface,
            "dst_hostname": link.dst_hostname,
            "last_seen": link.last_seen,
            "src_device_name": src_device.hostname if src_device else None,
            "dst_device_name": dst_device.hostname if dst_device else None,
        }
        result.append(link_data)

    return result
