class FileMetadata:
    # given path is in format: \\<IP>\<sharedFolderName>\<file path (can have multiple folders) >\< the last one in path(fileName if file) or (folder name if folder)>
    def __init__(self, full_unc_path, file_path, file_name, shared_folder_name,file_size, is_file, host):
        self.full_unc_path = full_unc_path           # Full path of the file
        self.file_path = file_path                   # Path of the file
        self.file_name = file_name                   # Name of the file
        self.shared_folder_name = shared_folder_name     # Name of the shared folder
        self.file_size = file_size                   # Size of the file or folder (in bytes)
        self.is_file = is_file                         # is file or directory
        self.host = host                 # Owner of the file (name of pc which contains file)
