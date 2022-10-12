// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Character, User, S3object, State } = initSchema(schema);

export {
  Character,
  User,
  S3object,
  State
};