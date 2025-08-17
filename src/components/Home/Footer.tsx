"use client"
import Link from "next/link"
import { RiInstagramFill, RiYoutubeFill, RiFacebookCircleFill } from "react-icons/ri";

export default function Footer() {
    return (
        <div className="w-full bg-background text-foreground p-4 flex flex-col gap-6 lg:gap-10">
            {/* links */}
            <div className="flex justify-center gap-3 md:space-x-10 text-foreground text-lg">
                <Link href={'/'} className="text-center text-sm ">
                    <p>Home</p>
                </Link>
                <Link href={'google.com'} className="text-center text-sm ">
                    <p>Application</p>
                </Link>
                <Link href={'/privacy_policy'} className="text-center text-sm ">
                    <p>Privacy & Policy</p>
                </Link>
                <Link href={'/contact us'} className="text-center text-sm ">
                    <p>Contact us</p>
                </Link>

            </div>
            {/* TODO: adjust links */}
            {/* social media */}
            <div className="w-full flex justify-center gap-10 md:gap-28">
                {/* Instagram */}
                <Link href={'instagram.com/fsp'} target="_blank">
                    <div className="text-black bg-primary p-2 rounded-full">
                        {/* <Instagram size={22} /> */}
                        <RiInstagramFill size={30} />
                    </div>
                </Link>
                <Link href={'https://www.youtube.com/@frameplusdz'} target="_blank">
                    <div className="text-black bg-primary p-2 rounded-full">
                        <RiYoutubeFill size={30} />
                    </div>
                </Link>
                <Link href={'facebook.com/fsp'} target="_blank">
                    <div className="text-black bg-primary p-2 rounded-full">
                        <RiFacebookCircleFill size={30} />
                    </div>
                </Link>
            </div>

            <div>
                <p className="text-center">All rights reserved &copy; {new Date().getFullYear()} Frame Plus</p>
            </div>
        </div>
    )
}
