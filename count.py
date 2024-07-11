import pygit2
import csv
import concurrent.futures
import msgspec
from datetime import datetime

# Define the structure of the JSON data using msgspec
class PowerbankData(msgspec.Struct):
    totalAvailablePowerbanks: int

# Function to calculate totalAvailablePowerbanks from JSON data
def calculate_total_powerbanks(file_content):
    try:
        data = msgspec.json.decode(file_content, type=list[PowerbankData])
        total_powerbanks = sum(item.totalAvailablePowerbanks for item in data)
        return total_powerbanks
    except msgspec.DecodeError:
        return None

# Function to process a single commit and return results
def process_commit(repo, commit):
    try:
        tree = commit.tree
        if '_data/plugo.json' in tree:
            blob = repo[tree['_data/plugo.json'].id]
            try:
                file_content = blob.data.decode('utf-8')
                total_powerbanks = calculate_total_powerbanks(file_content)
                if total_powerbanks is not None:
                    commit_date = datetime.fromtimestamp(commit.commit_time).strftime('%Y-%m-%d')
                    return commit_date, total_powerbanks
            except Exception as e:
                return None
    except KeyError:
        pass
    return None

# Generator function to iterate through every 5th commit
def iterate_commits(repo):
    commit_count = sum(1 for _ in repo.walk(repo.head.target, pygit2.GIT_SORT_TOPOLOGICAL))
    processed_count = 0
    skip_count = 0
    
    for commit in repo.walk(repo.head.target, pygit2.GIT_SORT_TOPOLOGICAL):
        processed_count += 1
        if processed_count % 5 != 0:
            continue
        
        skip_count += 1
        progress = (skip_count / (commit_count // 5)) * 100
        print(f'Processing commit {skip_count}/{commit_count // 5} ({progress:.2f}%)', end='\r')
        
        yield commit

# Main function to process commits using concurrent.futures
def main():
    # Open the repository
    repo_path = '.'  # Assuming the script is run from the root of the repository
    repo = pygit2.Repository(repo_path)
    
    # Prepare CSV output
    output = [['date', 'totalAvailablePowerbanks']]
    
    # Process every 5th commit in parallel
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = []
        for commit in iterate_commits(repo):
            future = executor.submit(process_commit, repo, commit)
            futures.append(future)
        
        for future in concurrent.futures.as_completed(futures):
            result = future.result()
            if result:
                output.append(result)
    
    # Sort output by date, excluding the header row
    output_sorted = sorted(output[1:], key=lambda x: datetime.strptime(x[0], '%Y-%m-%d'))
    output_sorted.insert(0, output[0])  # Insert the header row back
    
    # Write the sorted output to CSV
    with open('powerbank-count.csv', 'w', newline='') as csvfile:
        csvwriter = csv.writer(csvfile)
        csvwriter.writerows(output_sorted)
    
    print("\nProcessing complete.")

if __name__ == "__main__":
    main()
