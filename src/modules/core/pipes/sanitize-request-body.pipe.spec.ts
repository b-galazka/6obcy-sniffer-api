import { SanitizeRequestBodyPipe } from './sanitize-request-body.pipe';

describe('SanitizeRequestBodyPipe', () => {
  it('should be defined', () => {
    expect(new SanitizeRequestBodyPipe()).toBeDefined();
  });
});
