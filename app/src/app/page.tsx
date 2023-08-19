import Image from "next/image";
import styles from "./page.module.css";
import { Button, ConfigProvider } from "antd";
export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="https://www.paige.com/binaries/content/gallery/us-en/logos/paige_logo_tm.svg"
          alt="Paige Logo"
          width={200}
          height={200}
          priority
        />
      </div>

      <a href="/products" className={styles.card}>
        <h2>
          Products <span>-&gt;</span>
        </h2>
        <p>Click to browse products</p>
      </a>
    </main>
  );
}
