import { decodeFromBase64, encodeToBase64 } from './lib/encode-decode';
import {
  EncoderFunction,
  EncodingOptions,
} from './types/createCookieSessionStorage';

export class Encoder {
  // By default, the encoder is enabled
  isEnabled: boolean = true;
  private encoder: EncoderFunction = encodeToBase64;
  private decoder: EncoderFunction = decodeFromBase64;
  private encoderParams: any[] = [];
  private decoderParams: any[] = [];

  constructor(options: EncodingOptions) {
    if (options !== undefined) {
      this.isEnabled = Boolean(options);
    }

    if (typeof options === 'object') {
      if (!options.encoder) {
        throw new Error('encoding options: must contain an encoder function');
      }

      if (typeof options.encoder !== 'function') {
        throw new Error('encoding options: encoder must be a function');
      }

      if (!options.decoder) {
        throw new Error('encoding options: must contain a decoder function');
      }

      if (typeof options.decoder !== 'function') {
        throw new Error('encoding options: decoder must be a function');
      }

      if (options.encoderParams && !Array.isArray(options.encoderParams)) {
        throw new Error('encoding options: encoderParams must be an array');
      }

      if (options.decoderParams && !Array.isArray(options.decoderParams)) {
        throw new Error('encoding options: decoderParams must be an array');
      }

      this.encoder = options.encoder;
      this.decoder = options.decoder;
      this.encoderParams = options.encoderParams || [];
      this.decoderParams = options.decoderParams || [];
    }
  }

  encode(value: string): string | never {
    try {
      if (this.encoderParams.length > 0) {
        return this.encoder(value, ...this.encoderParams);
      }
      return this.encoder(value);
    } catch (error) {
      throw new Error('Error in encoding. Please check your encoder function');
    }
  }

  decode(value: string): string | never {
    try {
      if (this.decoderParams.length > 0) {
        return this.decoder(value, ...this.decoderParams);
      }

      return this.decoder(value);
    } catch (error) {
      throw new Error('Error in decoding. Please check your decoder function');
    }
  }
}
