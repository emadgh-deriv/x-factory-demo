/** 3 · List loading: card-sized skeletons. 8 · Inside `.col.grid` they lay out as tiles. */
export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="cards" aria-busy="true" aria-label="Loading sport news">
      {Array.from({ length: count }, (_, i) => (
        <div className="card sk" key={i}>
          <div className="thumb">
            <div className="skb" />
          </div>
          <div className="ct">
            <div className="skb l1" />
            <div className="skb l2" />
            <div className="skb l3" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** 4 · Article loading. */
export function ArticleSkeleton() {
  return (
    <div className="art" aria-busy="true" aria-label="Loading article">
      <div className="skb h1" />
      <div className="skb h1 s" />
      <div className="skb l2" />
      <div className="skb l2" style={{ width: "80%" }} />
      <div className="skb l3" />
      <div className="skb img" />
      {Array.from({ length: 5 }, (_, i) => (
        <div className="skb l2" key={i} style={i === 4 ? { width: "70%" } : undefined} />
      ))}
    </div>
  );
}
