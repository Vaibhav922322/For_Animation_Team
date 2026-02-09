import re

class Utility:
    @staticmethod
    def is_null_or_white_space(value: str) -> bool:
        return value is None or value.strip() == ""

    @staticmethod
    def is_valid_ipv4(ip: str) -> bool:
        """
        Valid IPv4:
        - 4 octets separated by dots
        - each 0..255
        - disallows leading zeros like '01', '001' (but allows '0')
        """

        _IPV4_RE = re.compile(
                r"^(?:"
                r"(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)"
                r"\.){3}"
                r"(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)"
                r"$"
        )

        if not isinstance(ip, str):
            return False
        ip = ip.strip()
        return bool(_IPV4_RE.match(ip))