"use client";

import { Inter } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Container } from "@radix-ui/themes";
import { PrivyProvider } from "@privy-io/react-auth";
import Header from "./components/header";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider appId="clvyg5hc308tixi9m43pjngmw">
          <Theme
            accentColor="mint"
            grayColor="gray"
            panelBackground="solid"
            scaling="100%"
            radius="medium"
          >
            <Container maxWidth="640px" mx="2">
              <Header />
              {children}
            </Container>
          </Theme>
        </PrivyProvider>
      </body>
    </html>
  );
}
