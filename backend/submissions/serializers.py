def serialize_submission(submission):
    return {
        "id": submission.id,
        "title": submission.title,
        "content": submission.content,
        "submission_type": submission.submission_type,
        "status": submission.status,
        "submitted_by": submission.submitted_by.username,
        "created_at": submission.created_at,
    }
