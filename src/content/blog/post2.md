---
title: "Building a Proxmox Cluster at Home"
description: "How I turned some old hardware into a proper virtualization cluster for learning and self-hosting."
pubDate: "Dec 15 2024"
heroImage: "/blog2.webp"
tags: ["homelab", "proxmox"]
---

Started with one old Dell Optiplex. Now I'm running a three-node Proxmox cluster with HA, shared storage, and way too many VMs.

The setup is overkill for my actual needs, but that's not the point. The point is learning - and breaking things in a safe environment before I break them at work.

Current stack: OPNsense for routing, TrueNAS for storage, and a mix of LXC containers and VMs running everything from Plex to a full Kubernetes cluster.

Best investment? A cheap managed switch with VLAN support. Proper network segmentation changed how I think about infrastructure.

Next project: migrating everything to NixOS-based configs with Colmena for deployment.
