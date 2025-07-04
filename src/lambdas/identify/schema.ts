export const IdentifyRequestSchema = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' },
    phoneNumber: { type: 'string' }
  },
  anyOf: [
    { required: ['email'] },
    { required: ['phoneNumber'] }
  ],
  additionalProperties: false
};

export const IdentifyResponseSchema = {
  type: 'object',
  properties: {
    contact: {
      type: 'object',
      properties: {
        primaryContatctId: { type: 'number' },
        emails: { type: 'array', items: { type: 'string' } },
        phoneNumbers: { type: 'array', items: { type: 'string' } },
        secondaryContactIds: { type: 'array', items: { type: 'number' } }
      },
      required: ['primaryContatctId', 'emails', 'phoneNumbers', 'secondaryContactIds']
    }
  },
  required: ['contact']
};
