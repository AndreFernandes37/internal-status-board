import si from 'systeminformation';

export async function getSystemInfo() {
  const [currentLoad, mem, fs, time, temp, netIfaces] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.fsSize(),
    si.time(),
    si.cpuTemperature(),
    si.networkInterfaces(),
  ]);

  // Pick root-ish disk
  const rootDisk = fs.find((d) => d.mount === '/' || d.mount?.toLowerCase().startsWith('c:')) || fs[0];

  // Determine primary IPv4
  const primaryIface = netIfaces.find((n) => n.ip4 && !n.internal) || netIfaces[0];

  return {
    load: {
      avg1: currentLoad.avgload, // system average load (approx)
      current: currentLoad.currentload,
    },
    cpu: {
      usage: currentLoad.currentload,
      temp: {
        value: temp?.main ?? null,
        available: typeof temp?.main === 'number' && temp.main > 0,
      },
    },
    mem: {
      total: mem.total,
      used: mem.active,
      usedPercent: mem.active / mem.total * 100,
    },
    disk: rootDisk ? {
      mount: rootDisk.mount,
      size: rootDisk.size,
      used: rootDisk.used,
      usedPercent: rootDisk.use,
      available: rootDisk.size - rootDisk.used,
    } : null,
    uptimeSec: time.uptime,
    network: {
      iface: primaryIface?.ifaceName || primaryIface?.iface || null,
      ipv4: primaryIface?.ip4 || null,
    },
    ts: Date.now(),
  };
}
