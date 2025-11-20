type BlogDetailProps = {
    params: Promise<{ id: string }>;
}

export default async function BlogDetail({ params }: BlogDetailProps) {
    const { id } = await params;


    return (
        <div>
            <h1>Blog Post #{id}</h1>
            <p>This is a mock blog detail page for post ID {id}</p>
        </div>
    );
}   