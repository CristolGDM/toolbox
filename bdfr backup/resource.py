#!/usr/bin/env python3
# coding=utf-8

import hashlib
import logging
import re
import time
import urllib.parse
from typing import Optional

import _hashlib
import requests
from praw.models import Submission

from tqdm import tqdm

from bdfr.exceptions import BulkDownloaderException

logger = logging.getLogger(__name__)


class Resource:
    def __init__(self, source_submission: Submission, url: str, extension: str = None):
        self.source_submission = source_submission
        self.content: Optional[bytes] = None
        self.url = url
        self.hash: Optional[_hashlib.HASH] = None
        self.extension = extension
        if not self.extension:
            self.extension = self._determine_extension()

    @staticmethod
    def retry_download(url: str, max_wait_time: int, current_wait_time: int = 60) -> Optional[bytes]:
        try:
            response = requests.get(url, stream=True)
            total_size_in_bytes= int(response.headers.get('content-length', 0))
            block_size = 1024 #1 Kibibyte
            progress_bar = tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True, colour="yellow")
            chunks = []
            for data in response.iter_content(block_size):
                chunks.append(data)
                progress_bar.update(len(data))
            progress_bar.close()
            if total_size_in_bytes != 0 and progress_bar.n != total_size_in_bytes:
                raise BulkDownloaderException(
                    f'Download stream stopped')
            content = b''.join(chunks)

            if re.match(r'^2\d{2}', str(response.status_code)) and content:
                return content
            elif response.status_code in (408, 429):
                raise requests.exceptions.ConnectionError(f'Response code {response.status_code}')
            else:
                raise BulkDownloaderException(
                    f'Unrecoverable error requesting resource: HTTP Code {response.status_code}')
        except (requests.exceptions.ConnectionError, requests.exceptions.ChunkedEncodingError) as e:
            logger.warning(f'Error occured downloading from {url}, waiting {current_wait_time} seconds: {e}')
            time.sleep(current_wait_time)
            if current_wait_time < max_wait_time:
                current_wait_time += 60
                return Resource.retry_download(url, max_wait_time, current_wait_time)
            else:
                logger.error(f'Max wait time exceeded for resource at url {url}')
                raise

    def download(self, max_wait_time: int):
        if not self.content:
            try:
                content = self.retry_download(self.url, max_wait_time)
            except requests.exceptions.ConnectionError as e:
                raise BulkDownloaderException(f'Could not download resource: {e}')
            except BulkDownloaderException:
                raise
            if content:
                self.content = content
        if not self.hash and self.content:
            self.create_hash()

    def create_hash(self):
        self.hash = hashlib.md5(self.content)

    def _determine_extension(self) -> Optional[str]:
        extension_pattern = re.compile(r'.*(\..{3,5})$')
        stripped_url = urllib.parse.urlsplit(self.url).path
        match = re.search(extension_pattern, stripped_url)
        if match:
            return match.group(1)
