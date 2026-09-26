import Client from 'ssh2-sftp-client';
import * as fs from 'fs';
import * as path from 'path';

export interface SupplierSftpConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string; // It is safer to use an SSH private key instead of a password
  remoteDir: string;
}

/**
 * Uploads a local EDI file to the supplier's SFTP server.
 * 
 * @param localFilePath The absolute path to the local .edi file
 * @param config The SFTP credentials for the supplier
 */
export async function uploadEdiToSupplier(localFilePath: string, config: SupplierSftpConfig) {
  const sftp = new Client();
  const filename = path.basename(localFilePath);
  const remoteFilePath = `${config.remoteDir.endsWith('/') ? config.remoteDir : config.remoteDir + '/'}${filename}`;

  try {
    console.log(`Connecting to SFTP server: ${config.host}:${config.port} for supplier...`);
    
    // Connect to the supplier's SFTP server
    await sftp.connect({
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
      privateKey: config.privateKey ? fs.readFileSync(config.privateKey) : undefined,
    });

    console.log(`Connected! Uploading ${filename} to ${remoteFilePath}...`);
    
    // Perform the upload
    await sftp.fastPut(localFilePath, remoteFilePath);
    
    console.log(`Successfully uploaded ${filename} to supplier.`);
    
    // Optional: Move the local file from 'outbox' to an 'archive' folder after successful upload
    archiveFile(localFilePath);
    
    return true;
  } catch (err: any) {
    console.error(`Failed to upload ${filename} via SFTP:`, err.message);
    throw err;
  } finally {
    await sftp.end();
  }
}

function archiveFile(localFilePath: string) {
  try {
    const filename = path.basename(localFilePath);
    const archiveDir = path.join(process.cwd(), 'edi', 'archive');
    
    if (!fs.existsSync(archiveDir)) {
      fs.mkdirSync(archiveDir, { recursive: true });
    }
    
    const archivePath = path.join(archiveDir, filename);
    fs.renameSync(localFilePath, archivePath);
    console.log(`Archived ${filename} locally.`);
  } catch (err) {
    console.error('Failed to archive file locally', err);
  }
}
