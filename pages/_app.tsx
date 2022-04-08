import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider } from '../components/AuthProvider'
import Layout from '../components/Layout'


function MyApp({ Component, pageProps }: AppProps) {
  return(
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  )
}

export default MyApp
