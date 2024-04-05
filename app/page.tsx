import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import styles from '@/app/ui/home.module.css';

export default function Home() {
  return (
    <div className='min-h-screen grid place-items-center'>
            <div className='border rounded border-white/0 '>
                <h1 className='text-center text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-500 via-pink-400 to-blue-500 bg-clip-text text-transparent q-animate-gradient'>
                    NUCLEUS-EDU Quiz Generator
                </h1>
                <Link
                 href="/login"
                 className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
                >
                    <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
                </Link>
                </div>
     </div>
  )
}
