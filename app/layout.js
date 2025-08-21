export const metadata = {
  title: 'Personal Assistant',
  description: 'Tiny AI Prompt App using Next.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
