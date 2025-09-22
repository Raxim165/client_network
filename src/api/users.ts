import z from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { api } from "./authUsers";

const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  dateBirth: z.string(),
})

const UsersListSchema = z.array(UserSchema);
export type Users = z.infer<typeof UserSchema>

type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; users: Users[] }
  | { status: 'error'; error: string };

const getUsers = async (): Promise<Users[]> =>
  api.get(`/users`).then(({data}) => UsersListSchema.parse(data));

export function useGetUsers() {
  const [state, setState] = useState<RequestState>({ status: "idle" });

  useEffect(() => {
    setState({ status: "loading" });
    getUsers()
    .then(users => setState({ status: "success", users }))
    .catch(err => setState({ status: "error", error: err }));
  }, []);

  return { state };
}
