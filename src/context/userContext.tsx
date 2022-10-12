import React, { useState, useEffect, createContext, useContext } from "react";
import { Auth, Hub } from "aws-amplify";
import { useRouter } from "next/router";

const UserContext = createContext(null);

export function useUser() {
  return useContext(UserContext);
}

export default function UserProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
      } catch (error) {
        console.error(error);
      }
    };
    getUser();
  }, []);

  async function signup(username: string, password: string, email: string) {
    try {
      const { user, userSub } = await Auth.signUp({
        username,
        password,
        attributes: {
          email,
        },
        autoSignIn: {
          enabled: true,
        },
      });
      setUser(user);
      user.getUserAttributes((error, data) => {
        console.log(error ?? data);
      });
      console.log(userSub);
    } catch (error) {
      throw Error(error.message.split(":")[1] ?? error.message);
    }
  }

  async function confirmSignUp(username: string, code: string) {
    try {
      await Auth.confirmSignUp(username, code);
    } catch (error) {
      throw Error(error.message.split(":")[1]);
    }
  }

  async function signin(username: string, password: string) {
    try {
      const user = await Auth.signIn(username, password);
      setUser(user);
    } catch (error) {
      throw Error(error.message.split(":")[1] ?? error.message);
    }
  }

  async function signout() {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (error) {
      throw Error(error.message.split(":")[1] ?? error.message);
    }
  }

  function listenToAutoSignInEvent() {
    return Hub.listen("auth", ({ payload }) => {
      const { event } = payload;
      if (event === "autoSignIn") {
        const user = payload.data;
        setUser(user);
        router.push("/");
      } else if (event === "autoSignIn_failure") {
        router.push("/signin");
      }
    });
  }

  useEffect(() => {
    const listener = listenToAutoSignInEvent();

    return () => {
      listener();
    };
  }, []);

  const value = {
    user,
    setUser,
    signup,
    signin,
    signout,
    confirmSignUp,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
