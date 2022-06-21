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
              {Math.ceil(
                post.data.content.reduce(function Calc(
                  acc,
                  currentValue,
                  index,
                  array
                ) {
                  acc +=
                    currentValue.body
                      .map(bodyM => bodyM.text)
                      .join()
                      .split(/\s/g).length +
                    (currentValue.heading
                      ? currentValue.heading.split(/\s/g).length
                      : 0);
                  return acc;
                },
                0) / 200
              )}{' '}
              min
            </span>
          </div>
          {post.data.content.map(Content => {
            return (
              <section>
                <h2>{Content.heading}</h2>
                {Content.body.map(bodyM => ` ${bodyM.text}  `)}
              </section>
            );
          })}
        </main>
      </div>
    </div>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post-id');
  const path = posts.results.map(p => {
    return { params: { slug: p.slugs && p.slugs.map(p => p).toString() } };
  });

  return {
    paths: path,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post-id', String(slug));

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(contentResponse => {
        return {
          heading: contentResponse.heading,
          body: contentResponse.body.map(bodyM => {
            return { text: bodyM.text };
          }),
        };
      }),
    },
  };

  return {
    props: { post },
  };
};
