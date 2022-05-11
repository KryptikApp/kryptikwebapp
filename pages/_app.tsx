import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Layout from '../components/Layout'
import { KryptikAuthProvider } from '../components/KryptikAuthProvider'


function MyApp({ Component, pageProps }: AppProps) {
  return(
      <KryptikAuthProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </KryptikAuthProvider>
  )
}

export default MyApp
