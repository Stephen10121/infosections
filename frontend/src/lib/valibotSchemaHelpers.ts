import * as v from "valibot";

export const EmailSchema = v.pipe(
  v.string(),
  v.nonEmpty('Please enter your email.'),
  v.email('The email is badly formatted.'),
  v.maxLength(30, 'Your email is too long.')
);