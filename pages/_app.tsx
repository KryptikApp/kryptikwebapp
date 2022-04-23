import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { KryptikWalletProvider } from '../components/KryptikWalletProvider'
import Layout from '../components/Layout'
import { KryptikServiceProvider } from '../components/KryptikServiceProvider'
import { AuthUserProvider } from '../components/AuthProvider'


function MyApp({ Component, pageProps }: AppProps) {
  return(
    <AuthUserProvider>
    <KryptikServiceProvider>
      <KryptikWalletProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </KryptikWalletProvider>
    </KryptikServiceProvider>
    </AuthUserProvider>   
  )
}

export default MyApp
