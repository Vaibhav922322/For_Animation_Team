import subprocess
import signal
import sys
import os
import time
import threading

class ProcessManager:
    WAIT_TIME = 30
    def __init__(self):
        self.backend_proc = None
        self.frontend_proc = None
        self.stop_logging = threading.Event()

    def log_streamer(self, pipe, prefix):
        """Continuously reads and prints logs from a pipe."""
        with pipe:
            for line in iter(pipe.readline, ''):
                if self.stop_logging.is_set():
                    break
                if line:
                    print(f"[{prefix}]: {line.strip()}")

    def cleanup(self, *args):
        """Kills all child processes and exits."""
        print("\n[Orchestrator] Shutting down all processes...")
        if self.frontend_proc:
            print("[Orchestrator] Terminating Frontend...")
            self.frontend_proc.terminate()
        if self.backend_proc:
            print("[Orchestrator] Terminating Backend...")
            self.backend_proc.terminate()
        sys.exit(0)

    def isTimedOut(start_time):
        elapsed = time.time() - start_time
        return elapsed > ProcessManager.WAIT_TIME

    def start(self):

        # 1. Setup Paths
        backend_dir = os.path.abspath("backend")
        # Use the specific python executable path provided
        python_exe = os.path.join(backend_dir, "runtime", "backend_env_window", "Scripts", "python.exe")
        server_script = os.path.join("app", "run_server.py")

        print("[Orchestrator] Starting Backend...")

        # NOTE: Removed CREATE_NEW_CONSOLE so logs appear in THIS terminal.
        # If you want a separate window for logs, we'd need to log to a file instead.
        self.backend_proc = subprocess.Popen(
            [python_exe, server_script],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1
        )

        # 2. Monitor Backend Output for Success String
        started_successfully = False
        print(f"[Orchestrator] Waiting for server to initialize...  (for {ProcessManager.WAIT_TIME}s)")
        server_start_time = time.time()
        while not ProcessManager.isTimedOut(start_time=server_start_time ):
            line = self.backend_proc.stdout.readline()
            if not line: break
            
            print(f"[Backend]: {line.strip()}") # Print initial logs
            
            if "Uvicorn running on" in line:
                started_successfully = True
                break
            if self.backend_proc.poll() is not None:
                break

        if not started_successfully:
            print("[Orchestrator] ERROR: Backend failed to start.")
            self.cleanup()  

        # 3. Start a background thread to keep printing Backend logs
        threading.Thread(target=self.log_streamer, args=(self.backend_proc.stdout, "Backend"), daemon=True).start()

        # 4. Launch Frontend
        frontend_dir = os.path.abspath("frontend")
        # Use the specific python executable path provided
        
        frontend_script = os.path.join(frontend_dir, "run_frontend.bat")
        print("[Orchestrator] Backend is UP. Starting Frontend...")
        self.frontend_proc = subprocess.Popen([frontend_script], shell=True, cwd=frontend_dir)

        # 5. Continuous Monitoring
        try:
            while True:
                if self.backend_proc.poll() is not None:
                    print("[Orchestrator] Backend process terminated.")
                    break
                if self.frontend_proc and self.frontend_proc.poll() is not None:
                    print("[Orchestrator] Frontend process terminated.")
                    break
                time.sleep(1)
        except KeyboardInterrupt:
            pass
        finally:
            self.cleanup()

if __name__ == "__main__":
    manager = ProcessManager()
    
    # Handle manual termination (Ctrl+C)
    signal.signal(signal.SIGINT, manager.cleanup)
    signal.signal(signal.SIGTERM, manager.cleanup)
    
    manager.start()