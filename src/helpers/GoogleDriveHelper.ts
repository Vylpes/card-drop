import { Auth, drive_v3, google } from "googleapis";
import IGDriveFolderListing from "../contracts/IGDriveFolderListing";
import path, { resolve } from "path";
import os from 'os';
import uuid, { v4 } from 'uuid';
import { createWriteStream } from "fs";

export default class GoogleDriveHelper {
    private _auth: Auth.GoogleAuth;
    private _drive: drive_v3.Drive;

    constructor() {
        this._auth = new google.auth.GoogleAuth({
            keyFile: "gdrive-credentials.json",
            scopes: [
                "https://www.googleapis.com/auth/drive.readonly",
                "https://www.googleapis.com/auth/drive.metadata.readonly",
            ],
        });

        this._drive = google.drive( { version: "v3", auth: this._auth });
    }

    public async listFolder(folderId: string, pageSize: number): Promise<IGDriveFolderListing[]> {
        const params = {
            pageSize: pageSize,
            fields: "nextPageToken, files(id, name)",
            q: `'${folderId}' in parents and trashed=false`
        }

        const res = await this._drive.files.list(params);

        return res.data.files as IGDriveFolderListing[];
    }

    public downloadFile(fileId: string) {
        const res = this._drive.files.get({
            fileId: fileId,
            alt: 'media',
        }, {
            responseType: 'stream',
        })
        .then(res => {
            return new Promise((resolve, reject) => {
                const filePath = path.join(process.cwd(), 'temp', v4());
                const dest = createWriteStream(filePath);
                let progress = 0;

                res.data
                    .on('end', () => {
                        resolve(filePath);
                    })
                    .on('error', err => {
                        reject(err);
                    })
                    .on('data', d => {
                        progress += d.length;
                    })
                    .pipe(dest);
            });
        })
    }

    public async exportFile(fileId: string, mimeType: string) {
        const destPath = path.join(process.cwd(), 'temp', v4());
        const dest = createWriteStream(destPath);

        const res = await this._drive.files.export({
            fileId: fileId,
            mimeType: mimeType
        }, {
            responseType: 'stream',
        });

        await new Promise((resolve, reject) => {
            res.data
                .on('error', reject)
                .pipe(dest)
                .on('error', reject)
                .on('finish', resolve);
        })
    }
}