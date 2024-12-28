"use client";

import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import {signIn, signOut, useSession} from "next-auth/react";
import Link from "next/link";

export function Appbar () {
    const session = useSession();

    return <div className="flex justify-between items-center container mx-auto px-4 lg:px-6 h-14">
        <Link className="flex items-center justify-center" href="#">
          <Music className="h-6 w-6 mr-2 text-teal-400" />
          <span className="font-bold text-teal-400">MuSync</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm my-auto font-medium text-gray-300 hover:text-teal-500" href="#features">
            Features
          </Link>
          <Link className="text-sm my-auto font-medium text-gray-300 hover:text-teal-500" href="#">
            Pricing
          </Link>
          {session.data?.user && <Button className="bg-teal-500 text-gray-900 hover:bg-teal-400"
            onClick={() => {signOut()}}>
                Logout</Button>}

                {!session.data?.user && <Button className="bg-teal-500 text-gray-900 hover:bg-teal-400"
            onClick={() => {signIn()}}>
                Signin</Button>}
        </nav>
    </div>
} 