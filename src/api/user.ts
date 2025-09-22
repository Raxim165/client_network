import { z } from "zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useIsMyAccount } from "../store/isMyAccount";
import { useSessionStore } from "../store/useSessionStore";
import { api } from "./authUsers";

const UserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  dateBirth: z.string(),
});

export type User = z.infer<typeof UserSchema>; // только Account

type RequestState =
| { status: "idle" }
| { status: "loading" }
| { status: "success"; user: User }
| { status: "error"; error: string };

const getUser = async (userId: string): Promise<User> =>
  api.get(`/user/?userId=${userId}`)
    .then(({data}) => UserSchema.parse(data));

export function useGetUser() { // только Account
  const { myUserId, recipientId } = useSessionStore();
  const { isMyAccount } = useIsMyAccount();
  const [state, setState] = useState<RequestState>({ status: "idle" });

  const userId = isMyAccount ? myUserId : recipientId;

  useEffect(() => {
    if (!userId) return;
    setState({ status: "loading" });
    getUser(userId)
      .then(user => setState({ status: "success", user }))
      .catch(err => setState({ status: "error", error: err }))
  }, [userId]);

  return { state };
}
