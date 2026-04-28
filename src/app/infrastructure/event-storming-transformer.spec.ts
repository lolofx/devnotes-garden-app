import { describe, it, expect } from 'vitest';
import { EventStormingTransformer } from './event-storming-transformer';

describe('EventStormingTransformer', () => {
  const transformer = new EventStormingTransformer();

  it('should generate a graph LR header', () => {
    const result = transformer.transform('actor User');
    expect(result).toMatch(/^graph LR/);
  });

  it('should create a node for a single actor', () => {
    const result = transformer.transform('actor User');
    expect(result).toContain('N0[User]:::actor');
  });

  it('should create a node for a command with quoted label', () => {
    const result = transformer.transform('command "Book flight"');
    expect(result).toContain('N0[Book flight]:::command');
  });

  it('should map event keyword to domainEvent class', () => {
    const result = transformer.transform('event "BookingConfirmed"');
    expect(result).toContain('N0[BookingConfirmed]:::domainEvent');
  });

  it('should chain nodes with arrows', () => {
    const result = transformer.transform('actor User\ncommand "Book flight"');
    expect(result).toContain('N0[User]:::actor --> N1[Book flight]:::command');
  });

  it('should add classDef for each used type', () => {
    const result = transformer.transform('actor User\ncommand "Book"');
    expect(result).toContain('classDef actor');
    expect(result).toContain('classDef command');
  });

  it('should not add classDef for unused types', () => {
    const result = transformer.transform('actor User');
    expect(result).not.toContain('classDef command');
    expect(result).not.toContain('classDef policy');
  });

  it('should skip empty lines', () => {
    const result = transformer.transform('actor User\n\ncommand "Book"');
    expect(result).toContain('N0[User]:::actor --> N1[Book]:::command');
  });

  it('should handle all 8 keyword types', () => {
    const dsl = [
      'actor User',
      'command "Book"',
      'event "Booked"',
      'policy "Notify"',
      'readModel "Bookings"',
      'aggregate Booking',
      'externalSystem "Email"',
      'hotspot "Slow"',
    ].join('\n');
    const result = transformer.transform(dsl);
    expect(result).toContain(':::actor');
    expect(result).toContain(':::command');
    expect(result).toContain(':::domainEvent');
    expect(result).toContain(':::policy');
    expect(result).toContain(':::readModel');
    expect(result).toContain(':::aggregate');
    expect(result).toContain(':::externalSystem');
    expect(result).toContain(':::hotspot');
  });
});
