import {
  Server,
  Networks,
  Transaction,
  TransactionBuilder,
  Operation,
  Keypair,
  Memo,
} from 'stellar-sdk';

export class StellarManager {
  private server: Server;
  private networkPassphrase: string;
  private keypair?: Keypair;

  constructor(config: { network: 'testnet' | 'public'; secretKey?: string }) {
    this.server = new Server(
      config.network === 'testnet'
        ? 'https://horizon-testnet.stellar.org'
        : 'https://horizon.stellar.org'
    );

    this.networkPassphrase = config.network === 'testnet' ? Networks.TESTNET : Networks.PUBLIC;

    if (config.secretKey) {
      this.keypair = Keypair.fromSecret(config.secretKey);
    }
  }

  async createDataTransaction(
    sourcePublicKey: string,
    dataKey: string,
    value: string
  ): Promise<Transaction> {
    try {
      const account = await this.server.loadAccount(sourcePublicKey);

      return new TransactionBuilder(account, {
        fee: String(await this.server.fetchBaseFee()),
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.manageData({
            name: dataKey,
            value: Buffer.from(value).toString('base64'),
          })
        )
        .setTimeout(30)
        .build();
    } catch (error) {
      console.error('Error creating data transaction:', error);
      throw new Error('Failed to create Stellar transaction');
    }
  }

  async submitTransaction(transaction: Transaction): Promise<string> {
    try {
      if (!this.keypair) {
        throw new Error('No secret key provided');
      }

      transaction.sign(this.keypair);
      const result = await this.server.submitTransaction(transaction);
      return result.hash;
    } catch (error) {
      console.error('Error submitting transaction:', error);
      throw new Error('Failed to submit transaction');
    }
  }

  async createPaperSubmissionTransaction(
    authorPublicKey: string,
    ipfsHash: string,
    metadata: object
  ): Promise<Transaction> {
    try {
      const account = await this.server.loadAccount(authorPublicKey);

      return new TransactionBuilder(account, {
        fee: String(await this.server.fetchBaseFee()),
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(
          Operation.manageData({
            name: 'paper_hash',
            value: ipfsHash,
          })
        )
        .addOperation(
          Operation.manageData({
            name: 'metadata',
            value: Buffer.from(JSON.stringify(metadata)).toString('base64'),
          })
        )
        .addMemo(Memo.text('paper_submission'))
        .setTimeout(30)
        .build();
    } catch (error) {
      console.error('Error creating paper submission transaction:', error);
      throw new Error('Failed to create submission transaction');
    }
  }

  async getPaperHistory(paperHash: string): Promise<any[]> {
    try {
      const transactions = await this.server
        .transactions()
        .forAccount(this.keypair?.publicKey() || '')
        .call();

      return transactions.records.filter(tx => {
        const memo = tx.memo;
        return (
          memo === 'paper_submission' &&
          (tx.operations as any).some((op: any) => op.type === 'manage_data' && op.value === paperHash)
        );
      });
    } catch (error) {
      console.error('Error retrieving paper history:', error);
      throw new Error('Failed to retrieve paper history');
    }
  }

  async validateTransaction(transactionHash: string): Promise<boolean> {
    try {
      const transaction = await this.server.transactions().transaction(transactionHash).call();

      return transaction.successful;
    } catch (error) {
      console.error('Error validating transaction:', error);
      return false;
    }
  }
}
