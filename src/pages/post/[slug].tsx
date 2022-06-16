import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-reactjs';
import { useRouter } from 'next/router';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }
  const bodyP = post.data.content.map(p => p.body.map(w => w.text));
  const numberPBody = bodyP.join();
  const numberKeys = numberPBody.split(' ');

  const numberOfWordHeading = post.data.content
    .map(p => p.heading)
    .join()
    .split(' ');

  const numberOfWordBody = post.data.content
    .map(p => p.body.map(w => w.text))
    .join()
    .split(' ');

  const totalTime = (
    (numberOfWordHeading.length + numberOfWordBody.length) /
    200
  ).toFixed(0);

  console.log(numberOfWordHeading.length + numberOfWordBody.length);

  return (
    <div className={commonStyles.Container}>
      <div className={styles.Content}>
        <Header />
        <div className={styles.BannerContainer}>
          <img src={post.data.banner.url} alt="banner do post" />
        </div>
        <main>
          <h1>{post.data.title}</h1>
          <div className={styles.Info}>
            <span>
              <FiCalendar />
              {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
            <span>
              <FiUser />
              {post.data.author}
            </span>
            <span>
              <FiClock />
              {
                post.data.content.reduce((acumulador, currentValue) => acumulador + 2 , 0);
              }
            </span>
          </div>
          {post.data.content.map(Content => {
            return (
              <section>
                <h2>{Content.heading}</h2>
                {RichText.render(Content.body)}
              </section>
            );
          })}
          <div>oi</div>
        </main>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post-id');

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post-id', String(slug));

  const post = response;

  return {
    props: { post },
  };
};
