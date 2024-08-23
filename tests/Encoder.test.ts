import { EncodingOptions } from '../src/types/createCookieSessionStorage';
import { Encoder } from './../src/Encoder';
import { expect, it } from 'vitest';

it('should set isEnabled correctly', () => {
  expect(new Encoder(undefined).isEnabled).toBe(true);
  expect(new Encoder(true).isEnabled).toBe(true);
  expect(new Encoder(false).isEnabled).toBe(false);

  const options: EncodingOptions = {
    encoder: () => '',
    decoder: () => '',
  };

  expect(new Encoder(options).isEnabled).toBe(true);
});

it('should throw an error if the encoder is not a function', () => {
  const options: EncodingOptions = {
    encoder: 'not a function' as any,
    decoder: () => '',
  };

  expect(() => new Encoder(options)).toThrowError(
    'encoding options: encoder must be a function'
  );
});

it('should throw an error if the decoder is not a function', () => {
  const options: EncodingOptions = {
    encoder: () => '',
    decoder: 'not a function' as any,
  };

  expect(() => new Encoder(options)).toThrowError(
    'encoding options: decoder must be a function'
  );
});

it('should throw an error if the encoderParams is not an array', () => {
  const options: EncodingOptions = {
    encoder: () => '',
    decoder: () => '',
    encoderParams: 'not an array' as any,
  };

  expect(() => new Encoder(options)).toThrowError(
    'encoding options: encoderParams must be an array'
  );
});

it('should throw an error if the decoderParams is not an array', () => {
  const options: EncodingOptions = {
    encoder: () => '',
    decoder: () => '',
    decoderParams: 'not an array' as any,
  };

  expect(() => new Encoder(options)).toThrowError(
    'encoding options: decoderParams must be an array'
  );
});

it('should encode a value', () => {
  const encoder = new Encoder({
    encoder: (value) => value.toUpperCase(),
    decoder: (value) => value.toLowerCase(),
  });

  expect(encoder.encode('test')).toBe('TEST');
  expect(encoder.decode('TEST')).toBe('test');
});

it('should encode a value with params', () => {
  const encoder = new Encoder({
    encoder: (value, param1: string, param2: string) =>
      `${value}-${param1}-${param2}`,
    decoder: (value) => value,
    encoderParams: ['param1', 'param2'],
  });

  expect(encoder.encode('test')).toBe('test-param1-param2');
});

it('should encode to Base64 by default if there are no options', () => {
  const encoder = new Encoder(undefined);

  expect(encoder.encode('test')).toBe('dGVzdA==');
  expect(encoder.decode('dGVzdA==')).toBe('test');
});
