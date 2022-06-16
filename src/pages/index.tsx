import Head from 'next/head';
import { GetStaticProps } from 'next';
import { FiUser, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useState } from 'react';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';
import styles from './home.module.scss';
import styleCommom from '../styles/common.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState([postsPagination]);

  function handleShowMorePosts() {
    fetch(posts[posts.length - 1].next_page).then(data =>
      data.json().then(response => {
        const newPost = [
          ...posts,
          {
            next_page: response.next_page,
            results: response.results.map(post => {
              return {
                uid: post.uid,
                first_publication_date: format(
                  new Date(post.first_publication_date),
                  'dd/MMM/yyyy',
                  {
                    locale: ptBR,
                  }
                ),
                data: {
                  title: post.data.title,
                  subtitle: post.data.subtitle,
                  author: post.data.author,
                },
              };
            }),
          },
        ];
        setPosts(newPost);
      })
    );
  }

  return (
    <>
      <Head>
        <title>Início | Blog</title>
      </Head>
      <div className={styleCommom.Container}>
        <div className={styles.Content}>
          <Header />
          <main>
            {posts.map(arrayP => {
              return arrayP.results.map(post => {
                return (
                  <article>
                    <header>
                      <Link href={`post/${post.uid}`}>
                        <a>
                          <h2>{post.data.title}</h2>
                        </a>
                      </Link>
                    </header>
                    <p>{post.data.subtitle}</p>

                    <footer>
                      <span>
                        <FiCalendar />
                        <time>
                          {format(
                            new Date(post.first_publication_date),
                            'dd MMM yyyy',
                            {
                              locale: ptBR,
                            }
                          )}
                        </time>
                      </span>
                      <span>
                        <FiUser /> <strong>{post.data.author}</strong>
                      </span>
                    </footer>
                  </article>
                );
              });
            })}

            {posts[posts.length - 1].next_page && (
              <button onClick={handleShowMorePosts}>Carregar mais posts</button>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async req => {
  const prismic = getPrismicClient({ req });

  const response = await prismic.getByType('post-id', {
    pageSize: 1,
  });

  const postsPagination = {
    next_page: response.next_page,
    results: response.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'dd/MMM/yyyy',
          {
            locale: ptBR,
          }
        ),
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return {
    props: { postsPagination },
  };
};
