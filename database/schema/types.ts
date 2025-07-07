/**
 * Generic utility type for including relations with any table
 *
 * Usage examples:
 * - SchemaWith<User, UserRelations, 'emailVerifications'> - includes email verifications
 * - SchemaWith<User, UserRelations, 'emailVerifications' | 'thirdPartyAuths'> - includes multiple relations
 *
 * TypeScript will autocomplete available relation keys and ensure type safety
 */
export type SchemaWith<
  TTable,
  TRelations extends Record<string, any>,
  T extends keyof TRelations,
> = TTable & {
  [K in T]: TRelations[K]
}
