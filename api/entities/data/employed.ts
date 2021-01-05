import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class Employed {
  @Field()
  employed: boolean;

  @Field({ nullable: true })
  institution: string;

  @Field({ nullable: true })
  description: string;
}
