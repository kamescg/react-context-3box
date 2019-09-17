/* eslint-disable react/no-unused-state */
/* eslint-disable no-undef */
/* --- Global Dependencies --- */
import React from 'react';
let box;
// eslint-disable-next-line global-require
if (typeof window !== 'undefined') box = require('3box/dist/3box'); // Require 3Box if window is set.

/* ------ Component ------ */
export const BoxContext = React.createContext({});
export const BoxConsumer = ({ children }) => (
<BoxContext.Consumer>
  {
    boxstate => (
      <>
        {
          children && Array.isArray(children)
            ? children.map(child => React.cloneElement(child, { boxstate }))
            : React.cloneElement(children, { boxstate })
        }
      </>
    )
}
</BoxContext.Consumer>
);

class BoxProvider extends React.Component {
  constructor(props) {
    super(props);
    const address = window.ethereum.selectedAddress;

    this.state = {
      address,
      utils: box.idUtils,
      isDebugging: false,
      isInitialized: false,
      isRequestOpen: false,
      isLoggedIn: box.isLoggedIn(address),
      isLoggingIn: false,
      box: undefined,
      instance: undefined,
      listening: {},
      profile: undefined,
      profiles: {},
      verified: {},
      spaces: {},
      threads: {},
      requests: [],

      /* ---------------------- */
      // Personal Account APIs
      /* ---------------------- */
      addRequest: async (req) => {
        this.setState({
          isRequestOpen: true,
          requests: [
            ...this.state.requests,
            req
          ]
        });
      },

      confirmRequest: async (index) => {
        const req = this.state.requests[index];

        if (req && req.payload) {
          switch (req.type) {
            case 'set':
              this.state.set(req.payload);
              break;

            default:

              break;
          }

          const reqs = this.state.requests;
          reqs.splice(index, 0);

          this.setState({
            requests: this.state.requests.splice(index, 0)
          });
        }
      },


      // 3Box
      /* ---------------------- */
      open: async () => {
        try {
          this.setState({
            isLoggingIn: true
          });
          const profile = await box.openBox(address, window.web3.currentProvider);
          this.setState({
            box: profile,
            instance: profile
          });
        } catch (error) {
          this.state.isDebugging && toast('Login Cancelled');
          this.state.isDebugging && toast(`${error}`);
          this.setState({
            isLoggedIn: false,
            isLoggingIn: false
          });
        }
      },

      logout: async () => {
        await this.state.box.logout();
        this.setState({
          box: undefined,
          instance: undefined,
          isLoggedIn: false,
          spaces: {},
          threads: {}
        });
      },

      verified: async ({ request, input }) => {
        const result = await this.state.box.verified[request](input);
        this.setState({
          verified: {
            ...this.state.spaces,
            [request]: result
          }
        });
      },
      // Write
      /* ---------------------- */
      get: async ({
 key, space, access, all 
}) => {
        let value;
        try {
          if (space) {
            all
              ? value = await this.state.spaces[space].instance[access].all()
              : value = await this.state.spaces[space].instance[access].get(key);

            this.setState({
              spaces: {
                ...this.state.spaces,
                [space]: {
                  ...this.state.spaces[space],
                  data: all ? value : { ...this.state.spaces[space], [key]: value }
                }
              }
            });
          } else {
            value = await this.state.box[access].get(key);
            this.setState({
              profile: {
                ...this.state.profile,
                [key]: value
              }
            });
          }
        } catch (error) {
        }
      },

      remove: async ({
 index, space, access, list 
}) => {
        if (space) {
          const data = await this.state.spaces[space].instance[access].get(list);
          if (data && Array.isArray(data)) {
            data.splice(Number(index), Number(index + 1));
            await this.state.spaces[space].instance[access].set(list, data);
            this.setState({
              spaces: {
                ...this.state.spaces,
                [space]: {
                  ...this.state.spaces[space],
                  data: {
                    ...this.state.spaces[space].data,
                    [list]: data
                  }
                }
              }
            });
          }
        } else {
        }
      },
      /**
       * @function removeItem
       * @description
       */
      removeItem: async ({
 index, space, access, list 
}) => {
        if (space) {
          const data = await this.state.spaces[space].instance[access].get(list);
          if (data && Array.isArray(data)) {
            const removed = data.splice(Number(index), Number(index + 1));
            await this.state.spaces[space].instance[access].set(list, data);
            this.setState({
              spaces: {
                ...this.state.spaces,
                [space]: {
                  ...this.state.spaces[space],
                  data: {
                    ...this.state.spaces[space].data,
                    [list]: data
                  }
                }
              }
            });

            /**
             * When deleting data users might want to first make a
             * backup/copy in case it was a mistake. The backup key
             * is the place to store that information.
             */
            if (backup) {
              this.state.set({
                keys: 'backup',
                inputs: removed,
                space: 'meshhub',
                append: true
              });
            }
          }
        } else {

        }
      },

      set: async ({
 keys, inputs, space, access, append, override 
}) => {
        try {
          if (space) {
            if (append) {
              const data = await this.state.spaces[space].instance[access].get(append);
              const listUpdated = Array.isArray(data) ? [...data, inputs] : [data, inputs];
              Array.isArray(data)
                ? await this.state.spaces[space].instance[access].set(append, listUpdated)
                : !override // todo set system for overriding data... add to backup space?
                  ? await this.state.spaces[space].instance[access].set(append, listUpdated)
                  : null;

              this.setState({
                spaces: {
                  ...this.state.spaces,
                  [space]: {
                    ...this.state.spaces[space],
                    data: {
                      ...this.state.spaces[space].data,
                      [append]: listUpdated
                    }
                  }
                }
              });
            } else {
              await this.state.spaces[space].instance[access].setMultiple(keys, inputs);
            }
          } else {
            await this.state.box[access].set(keys, inputs);
          }
        } catch (error) {
          console.log(error);
        }
      },

      publicSetMultiple: async (key, value, sapce) => {
        try {
          await this.state.box.public.setMultiple(key, value);
        } catch (error) {
          console.log(error);
          this.state.isDebugging && toast(`${error}`);
        }
      },

      publicGet: async (key, options, space) => {
        try {
          const value = await this.state.box.public.get(key, options);
          if (value) {
            this.setState({
              profile: {
                ...this.state.profile,
                [key]: value
              }
            });
          } else {
          }
        } catch (error) {
        }
      },

      // Link
      /* ---------------------- */
      listAddressLinks: async () => {
        try {
          const status = this.state.box && await this.state.box.listAddressLinks();
          if (status) {
            // todo @show toast message with TRUE status
          } else {
            // todo @show toast message with FALSE status
          }
        } catch (error) {
          console.log(error); // todo @show toast message with error
        }
      },
      isAddressLinked: async (queries) => {
        try {
          const status = this.state.box && await this.state.box.isAddressLinked(queries);
          if (status) {
            // todo @show toast message with TRUE status
          } else {
            // todo @show toast message with FALSE status
          }
        } catch (error) {
          console.log(error); // todo @show toast message with error
        }
      },
      linkAddress: async (name) => {
        try {
          const status = this.state.box && await this.state.box.linkAddress(name);
          if (status) {
            // todo @show toast message with TRUE status
          } else {
            // todo @show toast message with FALSE status
          }
        } catch (error) {
          console.log(error); // todo @show toast message with error
        }
      },
      removeAddressLink: async (address) => {
        try {
          const status = this.state.box && await this.state.box.removeAddressLink(address);
          if (status) {
            // todo @show toast message with TRUE status
          } else {
            // todo @show toast message with FALSE status
          }
        } catch (error) {
          console.log(error); // todo @show toast message with error
        }
      },

      // Spaces
      /* ---------------------- */
      openSpace: async (name) => {
        const space = this.state.box && await this.state.box.openSpace(name);
        this.setState({
          spaces: {
            ...this.state.spaces,
            [name]: {
              instance: space
            }
          }
        });
      },
      listSpaces: async (address) => {
        const spaces = await box.listSpaces(address);
        this.setState({
          profiles: {
            ...this.state.profiles,
            [address]: {
              ...this.state.profiles[address],
              spaces
            }
          }
        });
      },

      // Threads
      /* ---------------------- */
      joinThread: async (address, name) => {
        const thread = await this.state.box.joinThread(address, name);
        this.setState({
          ...this.state.threads,
          [name]: thread
        });
      },

      threadPost: async (thread, message) => {
        await this.state.threads[thread].post(message);
        this.setState({
          box: boxProfile
        });
      },

      threadListen: async (thread, callback) => {
        this.state.threads[thread].onUpdate(callback);
        this.setState({
          listening: {
            ...this.state.listening,
            [name]: true
          }
        });
      },

      threadAddModerator: async (thread, id) => {
        try {
          await this.state.threads[thread].addModerator(id);
        } catch (error) {
          console.log(error); // todo @show toast message with error
        }
      },
      threadAddMember: async (thread, id) => {
        try {
          await this.state.threads[thread].addMember(id);
        } catch (error) {
          console.log(error); // todo @show toast message with error
        }
      },

      /* ---------------------- */
      // Utility Methods
      /* ---------------------- */

      // Profile
      getProfile: async (address) => {
        const profile = await box.getProfile(address);
        this.setState({
          profile
        });
      },

      lookupProfile: async (address) => {
        if (address) {
          const profile = await box.getProfile(address);
          this.setState({
            profiles: {
              ...this.state.profiles,
              [address]: {
                ...this.state.profiles[address],
                profile
              }
            }
          });
        }
      },

      getThread: async (space, name, firstModerator, members, opts) => {
        const thread = await box.getThread(space, name, firstModerator, members, opts);
        this.setState({
          threads: {
            ...this.state.threads,
            [name]: thread
          }
        });
      },

      getThreadByAddress: async (address, name) => {
        const thread = await box.getThreadByAddress(address, name);
        this.setState({
          threads: {
            ...this.state.threads,
            [name]: thread
          }
        });
      },

      getConfig: async (address, opts) => {
        const config = await box.getConfig(address, opts);
        this.setState({
          profiles: {
            ...this.state.profiles,
            [address]: {
              ...this.state.profiles[address],
              config
            }
          }
        });
      },

      // Utilities
      getVerifiedAccounts: async (address) => {
        if (address) {
          let profile = this.state.profiles[address] && this.state.profiles[address].profile;
          if (profile) {
            const verified = await box.getVerifiedAccounts(profile);
            this.setState({
              profiles: {
                ...this.state.profiles,
                [address]: {
                  ...this.state.profiles[address],
                  verified
                }
              }
            });
          } else {
            profile = await box.getProfile(address);
            const verified = await box.getVerifiedAccounts(profile);
            this.setState({
              profiles: {
                ...this.state.profiles,
                [address]: {
                  ...this.state.profiles[address],
                  verified
                }
              }
            });
          }
        } else if(this.state.profile) {
            let verified = await box.getVerifiedAccounts(this.state.profile);
            this.setState({
              profile: {
                ...this.state.profile,
                verified
              }
            });
          } else {
            return false;
          }
      }
    };
  }

  // Component Did Mount
  async componentDidMount() {
    const address = window.ethereum && window.ethereum.selectedAddress || null;
    if (address) {
      const isLoggedIn = box.isLoggedIn(address);
      this.state.getProfile(address);

      // IF : Session is active open box.
      if (isLoggedIn && !this.state.box) {
        // this.state.open(address)
        this.state.listSpaces(address);
      }
      this.state.listSpaces(address); // Active Spaces List
    }
  }

  componentDidUpdate(prevProps, prevState) {
    // Request
    if (this.state.requests.length == 0 && prevState.requests.length > 0) {
      this.setState({
        isRequestOpen: false
      });
    }

    // Initial Component Loading
    if (this.state.box && !this.state.isInitialized) {
      this.state.getVerifiedAccounts();
      this.setState({
        isInitialized: true
      });
    }
  }

  render() {
    return (
      <>
        <BoxContext.Provider value={this.state}>
          {this.props.children}
        </BoxContext.Provider>
      </>
    );
  }
}

export default BoxProvider;
