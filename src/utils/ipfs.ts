import { create as createIPFS, IPFSHTTPClient } from 'ipfs-http-client';

export class IPFSManager {
    private client: IPFSHTTPClient;
    private gateway: string;

    constructor(nodeUrl: string, gateway: string = 'https://ipfs.io/ipfs') {
        this.client = createIPFS({ url: nodeUrl });
        this.gateway = gateway;
    }

    async uploadContent(content: string | Buffer): Promise<string> {
        try {
            const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
            const result = await this.client.add(buffer);
            return result.path;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw new Error('Failed to upload content to IPFS');
        }
    }

    async uploadJSON(data: object): Promise<string> {
        try {
            const jsonString = JSON.stringify(data);
            return await this.uploadContent(jsonString);
        } catch (error) {
            console.error('Error uploading JSON to IPFS:', error);
            throw new Error('Failed to upload JSON to IPFS');
        }
    }

    async getContent(hash: string): Promise<Buffer> {
        try {
            const chunks: Uint8Array[] = [];
            for await (const chunk of this.client.cat(hash)) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks);
        } catch (error) {
            console.error('Error retrieving from IPFS:', error);
            throw new Error('Failed to retrieve content from IPFS');
        }
    }

    async getJSON<T>(hash: string): Promise<T> {
        try {
            const content = await this.getContent(hash);
            return JSON.parse(content.toString());
        } catch (error) {
            console.error('Error retrieving JSON from IPFS:', error);
            throw new Error('Failed to retrieve JSON from IPFS');
        }
    }

    getGatewayURL(hash: string): string {
        return `${this.gateway}/${hash}`;
    }

    async isAvailable(hash: string): Promise<boolean> {
        try {
            const content = await this.getContent(hash);
            return content.length > 0;
        } catch {
            return false;
        }
    }

    async pinContent(hash: string): Promise<void> {
        try {
            await this.client.pin.add(hash);
        } catch (error) {
            console.error('Error pinning content:', error);
            throw new Error('Failed to pin content');
        }
    }

    async unpinContent(hash: string): Promise<void> {
        try {
            await this.client.pin.rm(hash);
        } catch (error) {
            console.error('Error unpinning content:', error);
            throw new Error('Failed to unpin content');
        }
    }
}
