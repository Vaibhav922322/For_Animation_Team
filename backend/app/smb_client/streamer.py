from threading import Thread, Event
from queue import Queue
from smb.SMBConnection import SMBConnection

class QueueFile:
    def __init__(self, queue):
        self.queue = queue
    def write(self, data):
        self.queue.put(data)
    def flush(self): pass
    def close(self): pass

class SMBStreamer:
    def __init__(self, conn: SMBConnection, share: str, path: str):
        self.conn = conn
        self.share = share
        self.path = path
        self.queue = Queue(maxsize=10) # Buffer 10 chunks
        self.error = None
        self.thread = None

    def start(self):
        self.thread = Thread(target=self._worker)
        self.thread.start()

    def _worker(self):
        try:
            # retrieveFile writes to our QueueFile, which puts chunks into self.queue
            self.conn.retrieveFile(self.share, self.path, QueueFile(self.queue))
            self.queue.put(None) # Sentinel for EOF
        except Exception as e:
            print(f"Stream error: {e}")
            self.error = e
            self.queue.put(None) # Signal EOF so generator unblocks
        # Do not close conn here; generator does it or caller does it.
        # Actually, generator should close it to ensure cleanup.

    def generator(self):
        """
        Yields chunks of data. Closes connection when done.
        """
        try:
            while True:
                chunk = self.queue.get()
                if chunk is None:
                    if self.error:
                         # We can't raise exception easily in generator if we already yielded?
                         # Actually we can.
                         raise self.error
                    break
                yield chunk
        finally:
            try:
                self.conn.close()
                print("SMB connection closed by streamer")
            except Exception:
                pass
