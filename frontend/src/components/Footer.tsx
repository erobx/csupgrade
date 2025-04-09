export default function Footer() {
  return (
    <footer className="footer sm:footer-horizontal bg-neutral text-neutral-content p-4 mt-5 w-full">
      <aside className="grid-flow-col items-center">
        <p>Copyright @ {new Date().getFullYear()} CSUpgrade - All right reserved</p>
      </aside>
    </footer>
  )
}
