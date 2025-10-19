import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"

interface Comment {
	id: string
	content: string
	createdAt: Date | string
	author: {
		name?: string | null
		image?: string | null
	}
}

interface CharacterCommentsTabProps {
	comments?: Array<{ comment: Comment }> | null
}

export function CharacterCommentsTab({ comments }: CharacterCommentsTabProps) {
	if (!comments || comments.length === 0) {
		return (
			<Card>
				<CardContent className="text-center py-8 text-muted-foreground">
					No comments yet
				</CardContent>
			</Card>
		)
	}

	return (
		<div className="space-y-3">
			{comments.map((cc) => (
				<Card key={cc.comment.id}>
					<CardContent className="p-4">
						<div className="flex items-start gap-3">
							<Avatar>
								<AvatarImage src={cc.comment.author.image || undefined} />
								<AvatarFallback>
									{cc.comment.author.name?.charAt(0).toUpperCase() || "U"}
								</AvatarFallback>
							</Avatar>
							<div className="flex-1">
								<div className="flex items-center gap-2 mb-1">
									<span className="font-medium">{cc.comment.author.name}</span>
									<span className="text-xs text-muted-foreground">
										{new Date(cc.comment.createdAt).toLocaleDateString()}
									</span>
								</div>
								<p className="text-sm text-muted-foreground">
									{cc.comment.content}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
