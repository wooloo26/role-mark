interface ErrorMessageProps {
	message: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
	if (!message) return null

	return (
		<div className="p-4 text-sm font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-lg">
			{message}
		</div>
	)
}
