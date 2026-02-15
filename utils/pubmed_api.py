import logging
from Bio import Entrez
import json
import time

class PubMedAPI:
    def __init__(self, email):
        Entrez.email = email
        self.logger = logging.getLogger(__name__)

    def search_papers(self, query, days_back=7, max_results=100):
        """
        Search PubMed for papers matching the query within the last N days.
        """
        try:
            # Calculate date range
            # Note: Entrez date format is YYYY/MM/DD
            # For simplicity in this initial version, we use 'reldate' parameter
            handle = Entrez.esearch(
                db="pubmed",
                term=query,
                retmax=max_results,
                reldate=days_back,
                datetype="pdat",
                usehistory="y"
            )
            record = Entrez.read(handle)
            handle.close()
            
            if not record["IdList"]:
                self.logger.info(f"No papers found for query: {query}")
                return []

            return self.fetch_details(record["IdList"])

        except Exception as e:
            self.logger.error(f"Error searching PubMed: {e}")
            return []

    def fetch_details(self, id_list):
        """
        Fetch detailed metadata for a list of PubMed IDs.
        """
        try:
            ids = ",".join(id_list)
            handle = Entrez.efetch(db="pubmed", id=ids, retmode="xml")
            records = Entrez.read(handle)
            handle.close()
            
            papers = []
            if 'PubmedArticle' not in records:
                 return []

            for article in records['PubmedArticle']:
                paper = self._parse_article(article)
                if paper:
                    papers.append(paper)
            
            return papers

        except Exception as e:
            self.logger.error(f"Error fetching details: {e}")
            return []

    def _parse_article(self, article):
        """
        Parse raw PubMed XML into a structured dictionary.
        """
        try:
            medline = article['MedlineCitation']
            article_data = medline['Article']
            
            # Extract basic info
            pmid = str(medline['PMID'])
            title = article_data.get('ArticleTitle', '')
            journal = article_data.get('Journal', {}).get('Title', '')
            
            # Extract PubDate
            pub_date_data = article_data.get('Journal', {}).get('JournalIssue', {}).get('PubDate', {})
            pub_date = f"{pub_date_data.get('Year', '')}-{pub_date_data.get('Month', '')}-{pub_date_data.get('Day', '')}"

            # Extract Authors
            authors = []
            if 'AuthorList' in article_data:
                for a in article_data['AuthorList']:
                    if 'LastName' in a and 'ForeName' in a:
                        author = {
                            'first_name': a['ForeName'],
                            'last_name': a['LastName'],
                            'affiliation': [],
                            'email': None
                        }
                        
                        # Extract Affiliation info if available (often contains email)
                        if 'AffiliationInfo' in a:
                            for aff in a['AffiliationInfo']:
                                if 'Affiliation' in aff:
                                    author['affiliation'].append(aff['Affiliation'])
                        
                        authors.append(author)

            # DOI
            doi = ""
            if 'ELocationID' in article_data:
                for eloc in article_data['ELocationID']:
                    if eloc.attributes.get('EIdType') == 'doi':
                        doi = str(eloc)

            return {
                'id': pmid,
                'title': title,
                'journal': journal,
                'pub_date': pub_date,
                'doi': doi,
                'authors': authors,
                'source': 'pubmed'
            }
            
        except Exception as e:
            self.logger.warning(f"Error parsing article {article.get('MedlineCitation', {}).get('PMID', 'Unknown')}: {e}")
            return None
