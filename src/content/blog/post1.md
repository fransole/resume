---
title: "Why I Switched to NixOS"
description: "After years of distro-hopping, I finally found my forever home with NixOS and its declarative approach to system configuration."
pubDate: "Jan 10 2025"
heroImage: "/blog1.webp"
tags: ["linux", "nixos"]
---

I've tried them all - Ubuntu, Arch, Fedora, you name it. But NixOS changed everything for me.

The killer feature? Declarative configuration. My entire system is defined in a single flake. Hardware config, packages, dotfiles - all version controlled. If something breaks, I roll back. If I get a new machine, I run one command and I'm back to my exact setup.

The learning curve is real, but worth it. Nix the language takes some getting used to, and debugging can be frustrating. But once it clicks, you'll wonder how you ever lived without it.

My favorite part is impermanence - my root filesystem wipes on every reboot, keeping only what I explicitly persist. It forces good habits and keeps the system clean.
