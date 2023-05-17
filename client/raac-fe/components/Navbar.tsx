import Link from 'next/link'
import {useState, useEffect } from 'react'

const Navbar: React.FC = () => {
    return (
        <nav className="nav">
            <Link href="/">Logo</Link>
            <Link href="/mint">Mint</Link>
            <Link href="/collection">View Collection</Link>
            <Link href="/stake">Stake</Link>
        </nav>
    );
  };
  
  export default Navbar;