import Link from "next/link";
import useSWR from "swr";
import cheerio from "cheerio";

const fetcher = (...args) => fetch(...args).then(res => res.text());

const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const BASE_URL = "https://geekhack.org/index.php?board=132.0";

const extract = data => {
  if (!data) return [];
  const items = [];
  const query = cheerio.load(data);
  const listingQuery = "#messageindex tbody tr td.subject:not(.locked_sticky2)";
  const listings = query(listingQuery);
  for (var i = 0; i < listings.length; i++) {
    const qx = cheerio.load(listings[i]);
    items.push({
      title: qx("span a").text(),
      link: qx("span a")
        .attr("href")
        .replace(/PHPSESSID=.+\&/, ""),
      topic: qx("span a")
        .attr("href")
        .split("topic=")[1],
      author: qx("p > a:first-child").text()
    });
  }
  return items;
};

export default function InterestChecks() {
  const { data, error } = useSWR(PROXY_URL + BASE_URL, fetcher, {
    revalidateOnFocus: false
  });
  const listings = extract(data);

  return (
    <div>
      <h1>Interest Checks</h1>
      <Link href="/gb">
        <a>Group Buys</a>
      </Link>
      <ul>
        {listings.map(listing => (
          <li key={listing.title}>
            <Link href={`/topic/${listing.topic}`}>
              <a>
                {listing.title} [{listing.author}]
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
