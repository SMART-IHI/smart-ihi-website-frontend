export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-background py-6 text-center">
			<p className="text-sm text-muted">&copy; {currentYear} Institute of Human Immunology. All rights reserved.</p>
		</footer>
	);
}

