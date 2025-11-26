export default function Blog() {

    const posts = [
        { id: 1, title: "First Post", excerpt: "This is the first post." },
        { id: 2, title: "Second Post", excerpt: "This is the second post." },
        { id: 3, title: "Third Post", excerpt: "This is the third post." },
    ];

    return (
        <div>
            <h1>Blog Page</h1>
            <ul>
                {posts.map((post) => (
                    <li key={post.id} style={{marginBottom: "1.5rem"}}>
                        <h2>
                            <a href={`/blog/${post.id}`}>{post.title}</a>
                        </h2>
                        <p>{post.excerpt}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}