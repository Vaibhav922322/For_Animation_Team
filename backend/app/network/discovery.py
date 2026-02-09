import socket
import ipaddress
import psutil
from typing import List, Tuple
from concurrent.futures import ThreadPoolExecutor, as_completed

class NetworkDiscovery:
    def get_local_ip():
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        try:
            # Doesn't actually connect, just picks the right interface
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
        finally:
            s.close()
        return ip

    def get_lan_cidr():
        hostname = socket.gethostname()
        local_ip = socket.gethostbyname(hostname)
        for iface, addrs in psutil.net_if_addrs().items():
            for addr in addrs:
                if addr.family.name == "AF_INET" and addr.address == local_ip:
                    network = ipaddress.IPv4Network(
                        f"{addr.address}/{addr.netmask}",
                        strict=False
                    )
                    return str(network)

        return None

    def is_port_open(ip: str, port: int = 445, timeout: float = 0.4) -> bool:
        try:
            with socket.create_connection((ip, port), timeout=timeout):
                return True
        except OSError:
            return False

    def discover_hosts_in_cidr(cidr: str, port: int = 445) -> List[str]:
        """
        Discover SMB hosts in parallel instead of scanning sequentially.
        This greatly reduces total scan time on larger subnets.
        """
        net = ipaddress.ip_network(cidr, strict=False)

        # Prepare list of all host IPs in the CIDR
        ip_list = [str(ip) for ip in net.hosts()]
        hosts: List[str] = []

        if not ip_list:
            return hosts

        # Limit concurrency to avoid overwhelming the network / OS
        max_workers = min(len(ip_list), 64)

        def _check(ip_str: str) -> Tuple[str, bool]:
            return ip_str, NetworkDiscovery.is_port_open(ip_str, port=port)

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            futures = [executor.submit(_check, ip_str) for ip_str in ip_list]
            for fut in as_completed(futures):
                try:
                    ip_str, open_ok = fut.result()
                    print(fut.result())
                    if open_ok:
                        hosts.append(ip_str)
                except Exception:
                    # Ignore individual probe errors; treat them as "closed"
                    continue

        return hosts