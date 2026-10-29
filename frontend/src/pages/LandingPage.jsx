import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import * as adminService from '../services/adminService';
import '../styles/landing.css';

/* ── Inline SVG icons (no broken emoji) ──────────────────── */
const IconQuestion = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconStar = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconTag = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const IconAI = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v3a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" />
  </svg>
);

/* ─────────────────────────────────────────────────────────── */

const LandingPage = () => {
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  useEffect(() => {
    adminService.getTags()
      .then(data => setTags(data.slice(0, 10)))
      .catch(() => {})
      .finally(() => setTagsLoading(false));
  }, []);

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <section className="hero-showcase" aria-label="Campus Q&A overview">
          <div className="hero-copy animate-fade-up">
            <p className="hero-eyebrow">Built for campus learning</p>
            <h1 className="hero-heading">
              Get unstuck.<br />
              <em>Learn together.</em>
            </h1>
            <p className="hero-body">
              A focused Q&amp;A space for students to ask course questions, share what works,
              and find clear answers from their campus community.
            </p>
            <div className="hero-actions">
              <Link to="/questions" className="btn btn-primary btn-lg">
                Browse Questions
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                Join the community
              </Link>
            </div>

            <div className="hero-proof" role="list" aria-label="Platform highlights">
              <span role="listitem">
                <strong>Peer answers</strong> with AI assistance
              </span>
              <span className="proof-sep" aria-hidden="true">·</span>
              <span role="listitem">
                <strong>Reputation</strong> system
              </span>
              <span className="proof-sep" aria-hidden="true">·</span>
              <span role="listitem">
                <strong>Course</strong> tagging
              </span>
            </div>
          </div>
          <div className="hero-preview" aria-label="Example campus discussion">
            <div className="preview-topbar">
              <div className="preview-title"><span className="preview-live-dot" />Campus discussions</div>
              <Link to="/questions" className="preview-link">View all <span aria-hidden="true">&rarr;</span></Link>
            </div>
            <article className="preview-question">
              <div className="preview-meta"><span>CS 204</span><span>Algorithms</span><span>2 hours ago</span></div>
              <h2>Why does Dijkstra’s algorithm fail with negative edge weights?</h2>
              <p>I understand the greedy choice for non-negative weights, but I’m not seeing exactly where it breaks when a later path can reduce the total cost.</p>
              <div className="preview-tags"><span>graph-theory</span><span>homework-help</span></div>
            </article>
            <article className="preview-answer">
              <div className="preview-answer-heading"><span className="accepted-mark">&#10003;</span><span>Helpful answer</span><span className="answer-votes">&#9650; 18</span></div>
              <p>Once a node is marked complete, Dijkstra never revisits it. A negative edge can create a cheaper route afterward, so that earlier decision is no longer guaranteed.</p>
              <div className="preview-author"><span className="author-avatar">A</span><span><strong>Alex M.</strong><small>Computer Science · 240 rep</small></span></div>
            </article>
            <div className="preview-footer"><span><strong>6</strong> answers</span><span><strong>1</strong> accepted</span><span className="preview-status">Resolved</span></div>
          </div>
        </section>

        {/* ── FEATURES ──────────────────────────────────────── */}
        <section className="features-section main-content" aria-labelledby="features-heading">
          <div className="section-header">
            <h2 id="features-heading">Everything your campus needs</h2>
            <p>Designed for the academic workflow — from a stuck assignment to a deep technical discussion.</p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true"><IconQuestion /></div>
              <h3>Ask Questions</h3>
              <p>Stuck on an algorithms homework or a lab project? Post a detailed question and get answers from students who've been there.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true"><IconStar /></div>
              <h3>Earn Reputation</h3>
              <p>Your expertise is visible. Earn points when your answers are upvoted or accepted as the best solution — the more you help, the higher you rank.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon" aria-hidden="true"><IconTag /></div>
              <h3>Course Tagging</h3>
              <p>Filter by course codes like CS-101 or EE-202, or explore topics like algorithms, databases, and internship prep.</p>
            </article>

            <article className="feature-card">
              <div className="feature-icon feature-icon--ai" aria-hidden="true"><IconAI /></div>
              <h3>AI Assistance</h3>
              <p>Still stuck? Invoke the AI to get an instant Groq-powered answer grounded in your question context — clearly labelled so you always know its source.</p>
            </article>
          </div>
        </section>

        {/* ── HOW IT WORKS ──────────────────────────────────── */}
        <section className="how-section main-content" aria-labelledby="how-heading">
          <div className="section-header">
            <h2 id="how-heading">How it works</h2>
            <p>From question to resolution in three steps.</p>
          </div>

          <ol className="steps-list">
            <li className="step-item">
              <div className="step-num" aria-hidden="true">1</div>
              <div className="step-body">
                <h3>Post or search</h3>
                <p>Search the existing knowledge base first. If your question hasn't been answered, post it with a clear title, description, and relevant course tags.</p>
              </div>
            </li>
            <li className="step-item">
              <div className="step-num" aria-hidden="true">2</div>
              <div className="step-body">
                <h3>Collaborate</h3>
                <p>Peers, seniors, and alumni submit answers with code snippets, tips, and explanations. Upvote what helps, downvote what misleads.</p>
              </div>
            </li>
            <li className="step-item">
              <div className="step-num" aria-hidden="true">3</div>
              <div className="step-body">
                <h3>Accept &amp; close</h3>
                <p>Mark the best response as accepted. The author earns reputation, and the thread is resolved — ready to help the next student who finds it.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── REPUTATION TABLE ──────────────────────────────── */}
        <section className="rep-section main-content" aria-labelledby="rep-heading">
          <div className="rep-inner">
            <div className="rep-copy">
              <h2 id="rep-heading">Earn as you help</h2>
              <p>CampusQuery rewards contribution. Points accumulate every time your peers acknowledge your expertise.</p>
              <Link to="/register" className="btn btn-accent" style={{ marginTop: 'var(--space-5)' }}>
                Start contributing
              </Link>
            </div>
            <div className="rep-table-wrap">
              <table className="rep-table" aria-label="Reputation point actions">
                <thead>
                  <tr>
                    <th scope="col">Action</th>
                    <th scope="col">Points</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Question upvoted</td><td className="rep-pts rep-pos">+10</td></tr>
                  <tr><td>Answer upvoted</td><td className="rep-pts rep-pos">+15</td></tr>
                  <tr><td>Answer accepted as best</td><td className="rep-pts rep-pos">+20</td></tr>
                  <tr><td>Content downvoted</td><td className="rep-pts rep-neg">−2</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── POPULAR TAGS ──────────────────────────────────── */}
        <section className="tags-section main-content" aria-labelledby="tags-heading">
          <div className="section-header">
            <h2 id="tags-heading">Popular course tags</h2>
            <p>Browse by subject, course code, or technology area.</p>
          </div>
          <div className="tags-cloud" role="list">
            {tagsLoading ? (
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Loading tags…</p>
            ) : tags.length > 0 ? (
              tags.map(tag => (
                <Link
                  key={tag._id}
                  to={`/questions?tag=${tag.name}`}
                  className="tag-badge"
                  role="listitem"
                >
                  {tag.name}
                  {tag.questionCount > 0 && (
                    <span className="tag-count" aria-label={`${tag.questionCount} questions`}>
                      &nbsp;{tag.questionCount}
                    </span>
                  )}
                </Link>
              ))
            ) : (
              ['cs-101', 'data-structures', 'algorithms', 'database-systems', 'computer-networks', 'web-dev'].map(t => (
                <Link key={t} to={`/questions?tag=${t}`} className="tag-badge" role="listitem">{t}</Link>
              ))
            )}
          </div>
        </section>

        {/* ── CTA STRIP ─────────────────────────────────────── */}
        <section className="cta-strip" aria-label="Call to action">
          <div className="cta-strip-inner main-content">
            <h2>Ready to ask your first question?</h2>
            <p>Join hundreds of students sharing knowledge and solving problems together.</p>
            <div className="cta-strip-actions">
              <Link to="/register" className="btn btn-accent btn-lg">Create free account</Link>
              <Link to="/questions" className="btn btn-ghost btn-lg" style={{ color: 'var(--stone-300)' }}>
                Browse first
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
