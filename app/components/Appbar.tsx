"use client";

import {signIn, signOut, useSession} from "next-auth/react";
import Link from "next/link";

export function Appbar () {
    const session = useSession();

    return <div className="flex justify-between">
        <Link className="flex items-center justify-center" href="#">
          <Music className="h-6 w-6 mr-2 text-teal-400" />
          <span className="font-bold text-teal-400">MuSync</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium text-gray-300 hover:text-teal-400" href="#features">
            Features
          </Link>
        </nav>
        <div>
            Musi
        </div>
        <div>
            {session.data?.user && <button className="m-2 p-2 bg-blue-400"
            onClick={() => {signOut()}}>
                Logout</button>}

                {!session.data?.user && <button className="m-2 p-2 bg-blue-400"
            onClick={() => {signIn()}}>
                Signin</button>}
        </div>
    </div>
} 